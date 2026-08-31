import asyncio
import base64
import os
import uuid
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv(Path('/app/backend/.env'))

OUT_DIR = Path('/app/frontend/public/sculptflex/studio')
OUT_DIR.mkdir(parents=True, exist_ok=True)
SRC_DIR = Path('/app/frontend/public/sculptflex/colours')
MODEL = 'gemini-3.1-flash-image-preview'

COLOURS = {
    'black': 'Obsidian Black',
    'navy': 'Deep Navy',
    'mocha': 'Mocha Brown',
}

SHOTS = {
    'back': ('{c}.png', 'Back three-quarter view: woman standing looking over her shoulder, showing the scrunch seam.'),
    'front': ('{c}-front.png', 'Front view: woman standing facing the camera, one hand lightly on hip.'),
    'side': ('{c}-lunge.png', 'Side profile view: deep lunge stretch pose.'),
    'detail': ('{c}-detail.png', 'Close-up cropped at waist and hips: hands on the high waistband, showing seamless fabric texture and contour scrunch.'),
}

STYLE = (
    'Change the background to a clean seamless LIGHT GREY studio backdrop with soft, even, shadowless lighting '
    'and a very subtle floor shadow, like premium e-commerce product photography (Gymshark style). '
    'Keep the exact same athletic woman, same pose, same {colour} seamless scrunch leggings and white sports bra, '
    'photorealistic, vertical portrait.'
)


async def generate(colour_key, colour_name, shot_key, ref_name, pose):
    ref_path = SRC_DIR / ref_name.format(c=colour_key)
    with open(ref_path, 'rb') as f:
        ref_b64 = base64.b64encode(f.read()).decode('utf-8')
    chat = LlmChat(
        api_key=os.environ['EMERGENT_LLM_KEY'],
        session_id=f'studio-{uuid.uuid4()}',
        system_message='You are a premium e-commerce product photographer.',
    )
    chat.with_model('gemini', MODEL).with_params(modalities=['image', 'text'])
    msg = UserMessage(text=f'{STYLE.format(colour=colour_name)} Shot type: {pose}', file_contents=[ImageContent(ref_b64)])
    try:
        text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:
        print(f'FAIL {colour_key}-{shot_key}: {str(e)[:120]}', flush=True)
        return
    if not images:
        print(f'FAIL {colour_key}-{shot_key}: {str(text)[:120]}', flush=True)
        return
    out = OUT_DIR / f'{colour_key}-{shot_key}.png'
    with open(out, 'wb') as f:
        f.write(base64.b64decode(images[0]['data']))
    print(f'OK {out.name} ({out.stat().st_size})', flush=True)


async def main():
    batch = []
    for ck, cn in COLOURS.items():
        for sk, (ref, pose) in SHOTS.items():
            batch.append(generate(ck, cn, sk, ref, pose))
            if len(batch) == 3:
                await asyncio.gather(*batch)
                batch = []
    if batch:
        await asyncio.gather(*batch)
    print('DONE', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
