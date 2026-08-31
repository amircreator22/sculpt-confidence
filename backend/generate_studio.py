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
SRC_DIR = Path('/app/frontend/public/sculptflex')
MODEL = 'gemini-3.1-flash-image-preview'

STYLE = (
    'Change the background to a clean seamless LIGHT GREY studio backdrop with soft, even, shadowless lighting '
    'and a very subtle floor shadow, like premium e-commerce product photography (Gymshark style). '
    'Keep the exact same athletic woman, same pose, same charcoal grey seamless scrunch leggings and white sports bra, '
    'photorealistic, vertical portrait, full body visible where the pose allows.'
)

SHOTS = {
    'front': ('img4.png', 'Front view: woman standing facing the camera, arms relaxed, one hand lightly on hip.'),
    'back': ('img3.png', 'Back view: woman standing with her back to the camera, showing the scrunch seam.'),
    'side': ('img5.png', 'Side profile view: deep lunge stretch pose.'),
    'detail': ('img4.png', 'Close-up cropped at waist and hips: hands resting on the high waistband, showing seamless ribbed fabric texture and contour panels.'),
}


async def generate(key, ref_name, pose):
    with open(SRC_DIR / ref_name, 'rb') as f:
        ref_b64 = base64.b64encode(f.read()).decode('utf-8')
    chat = LlmChat(
        api_key=os.environ['EMERGENT_LLM_KEY'],
        session_id=f'studio-{uuid.uuid4()}',
        system_message='You are a premium e-commerce product photographer.',
    )
    chat.with_model('gemini', MODEL).with_params(modalities=['image', 'text'])
    msg = UserMessage(text=f'{STYLE} Shot type: {pose}', file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f'FAIL {key}: {str(text)[:120]}', flush=True)
        return
    out = OUT_DIR / f'{key}.png'
    with open(out, 'wb') as f:
        f.write(base64.b64decode(images[0]['data']))
    print(f'OK {out.name} ({out.stat().st_size})', flush=True)


async def main():
    await asyncio.gather(*[generate(k, r, p) for k, (r, p) in SHOTS.items()])
    print('DONE', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
