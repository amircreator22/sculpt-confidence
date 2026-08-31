import asyncio
import base64
import os
import uuid
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv(Path('/app/backend/.env'))

OUT_ROOT = Path('/app/frontend/public/catalog')
REF_DIR = Path('/app/frontend/public/sculptflex/studio')
MODEL = 'gemini-3.1-flash-image-preview'

NO_BRAND = (
    'IMPORTANT: the products must be completely unbranded — plain fabric with NO logos, NO text, NO labels, '
    'NO brand marks of any kind (especially no Gymshark branding).'
)
STYLE = (
    'Clean seamless LIGHT GREY studio backdrop with soft, even, shadowless lighting and a very subtle floor shadow, '
    'like premium e-commerce product photography. Photorealistic, vertical portrait orientation.'
)

BAND_SETS = {
    'blushtones': 'three plain fabric resistance loop bands in blush tones: light blush pink, dusty rose, and deep mauve',
    'neutraltones': 'three plain fabric resistance loop bands in neutral tones: cream, taupe, and mocha brown',
    'midnighttones': 'three plain fabric resistance loop bands in midnight tones: light grey, charcoal, and black',
}
BAND_SHOTS = {
    'front': 'The three bands neatly stacked flat lay, shot from a slight overhead angle.',
    'back': 'An athletic woman in plain black leggings and plain black sports bra doing a squat with one band stretched above her knees, full body.',
    'side': 'One band close-up at an angle showing the thick woven fabric texture and non-slip inner grip.',
    'detail': 'The three bands beside a small plain matching fabric drawstring carry pouch, styled flat lay.',
}


async def gen(out_path, prompt, ref=None):
    chat = LlmChat(
        api_key=os.environ['EMERGENT_LLM_KEY'],
        session_id=f'fix-{uuid.uuid4()}',
        system_message='You are a premium e-commerce product photographer.',
    )
    chat.with_model('gemini', MODEL).with_params(modalities=['image', 'text'])
    files = [ImageContent(ref)] if ref else []
    msg = UserMessage(text=prompt, file_contents=files)
    try:
        text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:
        print(f'FAIL {out_path}: {str(e)[:140]}', flush=True)
        return
    if not images:
        print(f'FAIL {out_path}: {str(text)[:140]}', flush=True)
        return
    with open(out_path, 'wb') as f:
        f.write(base64.b64decode(images[0]['data']))
    print(f'OK {out_path}', flush=True)


async def main():
    tasks = []
    for sk, sdesc in BAND_SETS.items():
        for shot, pose in BAND_SHOTS.items():
            out = OUT_ROOT / 'resistance-band-bundle' / f'{sk}-{shot}.png'
            tasks.append(gen(out, f'Product photo of {sdesc}. {pose} {NO_BRAND} {STYLE}'))

    with open(REF_DIR / 'back.png', 'rb') as f:
        ref = base64.b64encode(f.read()).decode('utf-8')
    navy_prompt = (
        'Using the reference photo: keep the exact same athletic woman, the same clean seamless light grey studio '
        'backdrop and the same soft even lighting. Replace her outfit: she now wears high-rise deep navy blue 5-inch '
        'inseam sculpt bike shorts with a scrunch back seam, paired with a plain white sports bra. '
        'Shot type: Back three-quarter view: woman standing looking over her shoulder. '
        f'{NO_BRAND} {STYLE}'
    )
    tasks.append(gen(OUT_ROOT / 'sculpt-shorts' / 'navy-back.png', navy_prompt, ref))

    for i in range(0, len(tasks), 3):
        await asyncio.gather(*tasks[i:i + 3])
    print('DONE', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
