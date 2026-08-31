import asyncio
import base64
import os
import uuid
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

BACKEND_DIR = Path('/app/backend')
load_dotenv(BACKEND_DIR / '.env')

OUT_DIR = Path('/app/frontend/public/sculptflex/colours')
MODEL = 'gemini-3.1-flash-image-preview'

COLOURS = {
    'black': 'Obsidian Black',
    'navy': 'Deep Navy',
    'mocha': 'Mocha Brown',
}

ANGLES = {
    'front': (
        'Using the woman and the exact same leggings colour from this photo: same athletic woman, same bright modern gym '
        'with concrete wall, plant and dumbbell rack, same {colour} seamless scrunch leggings and white sports bra. '
        'New photo: FRONT VIEW, standing facing the camera, one hand on her hip, confident smile, full body head to shoes visible. '
        'Premium activewear campaign photography, soft natural window light, editorial fitness brand style, photorealistic, vertical portrait.'
    ),
    'lunge': (
        'Using the woman and the exact same leggings colour from this photo: same athletic woman, same bright modern gym, '
        'same {colour} seamless scrunch leggings and white sports bra. '
        'New photo: SIDE PROFILE view, performing a deep lunge stretch with one knee forward, full body visible. '
        'Premium activewear campaign photography, soft natural window light, editorial fitness brand style, photorealistic, vertical portrait.'
    ),
    'detail': (
        'Using the leggings from this photo in the exact same {colour} colour. '
        'New photo: CLOSE-UP detail shot of the high waistband and glute contour scrunch seam of the leggings, model adjusting the waistband with both hands, '
        'showing the seamless ribbed knit fabric texture. Macro product photography, soft studio light, photorealistic, vertical portrait.'
    ),
}


async def generate(colour_key, colour_name, angle_key, prompt):
    ref_path = OUT_DIR / f'{colour_key}.png'
    with open(ref_path, 'rb') as f:
        ref_b64 = base64.b64encode(f.read()).decode('utf-8')

    chat = LlmChat(
        api_key=os.environ['EMERGENT_LLM_KEY'],
        session_id=f'gen-{uuid.uuid4()}',
        system_message='You are a professional activewear product photographer.',
    )
    chat.with_model('gemini', MODEL).with_params(modalities=['image', 'text'])

    msg = UserMessage(
        text=prompt.format(colour=colour_name),
        file_contents=[ImageContent(ref_b64)],
    )
    text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f'FAIL {colour_key}-{angle_key}: no image returned ({str(text)[:120]})', flush=True)
        return False
    out = OUT_DIR / f'{colour_key}-{angle_key}.png'
    with open(out, 'wb') as f:
        f.write(base64.b64decode(images[0]['data']))
    print(f'OK {out.name} ({out.stat().st_size} bytes)', flush=True)
    return True


async def main():
    tasks = []
    for colour_key, colour_name in COLOURS.items():
        for angle_key, prompt in ANGLES.items():
            tasks.append(generate(colour_key, colour_name, angle_key, prompt))
            if len(tasks) >= 3:
                await asyncio.gather(*tasks)
                tasks = []
    if tasks:
        await asyncio.gather(*tasks)
    print('DONE', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
