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

COLOUR_DESC = {
    'blush': 'soft blush pink',
    'black': 'deep obsidian black',
    'charcoal': 'charcoal grey',
    'mocha': 'warm mocha brown',
    'navy': 'deep navy blue',
}

POSES = {
    'front': ('front.png', 'Front view: woman standing facing the camera, one hand lightly on hip.'),
    'back': ('back.png', 'Back three-quarter view: woman standing looking over her shoulder.'),
    'side': ('side.png', 'Side profile view: deep lunge stretch pose.'),
    'detail': ('detail.png', None),
}

PRODUCTS = {
    'glute-sculpt-leggings': {
        'colours': ['blush', 'black', 'charcoal'],
        'garment': 'high-waisted {c} glute-sculpting leggings with a contour scrunch-bum seam, paired with a plain black sports bra',
        'detail': 'Close-up cropped at waist and hips: hands on the high waistband, showing the {c} fabric texture and contour scrunch seam.',
    },
    'seamless-sculpt-leggings': {
        'colours': ['black', 'mocha', 'blush'],
        'garment': 'seamless {c} second-skin knit leggings with subtle tonal shading under the glutes, paired with a plain white sports bra',
        'detail': 'Close-up cropped at waist and hips: showing the smooth seamless {c} knit texture with no front seam.',
    },
    'sculpt-shorts': {
        'colours': ['black', 'blush', 'navy'],
        'garment': 'high-rise {c} 5-inch inseam sculpt bike shorts with a scrunch back seam, paired with a plain white sports bra',
        'detail': 'Close-up cropped at hips and thighs: showing the {c} shorts hem, high waistband and scrunch seam.',
    },
    'ribbed-sculpt-shorts': {
        'colours': ['mocha', 'charcoal', 'blush'],
        'garment': 'high-rise {c} ribbed-texture sculpt shorts with a contour scrunch seam, paired with a plain black sports bra',
        'detail': 'Close-up cropped at hips and thighs: showing the soft ribbed {c} fabric texture and waistband.',
    },
    'sculpt-sports-bra': {
        'colours': ['blush', 'black', 'mocha'],
        'garment': 'a {c} medium-support sculpting sports bra with a sculpted neckline and wide soft underband, paired with plain black leggings',
        'detail': 'Close-up cropped at the torso: showing the {c} sports bra fabric, neckline and soft underband.',
        'detail_ref': 'front.png',
    },
    'sculpt-longline-bra': {
        'colours': ['black', 'charcoal', 'navy'],
        'garment': 'a {c} longline crop sports bra extending down to the ribcage with a sculpted neckline, paired with plain black leggings',
        'detail': 'Close-up cropped at the torso: showing the {c} longline bra fabric and extended silhouette.',
        'detail_ref': 'front.png',
    },
}

BAND_SETS = {
    'blushtones': 'three fabric resistance bands in blush tones: light blush pink, dusty rose, and deep mauve',
    'neutraltones': 'three fabric resistance bands in neutral tones: cream, taupe, and mocha brown',
    'midnighttones': 'three fabric resistance bands in midnight tones: light grey, charcoal, and black',
}

BAND_SHOTS = {
    'front': 'The three bands neatly stacked flat lay, shot from a slight overhead angle.',
    'back': 'An athletic woman in plain black leggings and black sports bra doing a squat with the medium band stretched above her knees, full body.',
    'side': 'One band close-up at an angle showing the thick woven fabric texture and non-slip inner grip.',
    'detail': 'The three bands beside a small matching fabric carry pouch, styled flat lay.',
}

STYLE = (
    'Clean seamless LIGHT GREY studio backdrop with soft, even, shadowless lighting and a very subtle floor shadow, '
    'like premium e-commerce product photography (Gymshark style). Photorealistic, vertical portrait orientation.'
)


def ref_b64(name):
    with open(REF_DIR / name, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')


async def gen(out_path, prompt, ref=None):
    if out_path.exists():
        print(f'SKIP {out_path}', flush=True)
        return
    chat = LlmChat(
        api_key=os.environ['EMERGENT_LLM_KEY'],
        session_id=f'cat-{uuid.uuid4()}',
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
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'wb') as f:
        f.write(base64.b64decode(images[0]['data']))
    print(f'OK {out_path} ({out_path.stat().st_size})', flush=True)


async def main():
    tasks = []
    for handle, spec in PRODUCTS.items():
        for ck in spec['colours']:
            cdesc = COLOUR_DESC[ck]
            garment = spec['garment'].format(c=cdesc)
            for shot, (ref_name, pose) in POSES.items():
                out = OUT_ROOT / handle / f'{ck}-{shot}.png'
                if shot == 'detail':
                    ref_name = spec.get('detail_ref', 'detail.png')
                    pose = spec['detail'].format(c=cdesc)
                prompt = (
                    f'Using the reference photo: keep the exact same athletic woman, the same clean seamless light grey '
                    f'studio backdrop and the same soft even lighting. Replace her outfit: she now wears {garment}. '
                    f'Shot type: {pose} {STYLE}'
                )
                tasks.append((out, prompt, ref_name))
    for sk, sdesc in BAND_SETS.items():
        for shot, pose in BAND_SHOTS.items():
            out = OUT_ROOT / 'resistance-band-bundle' / f'{sk}-{shot}.png'
            prompt = f'Product photo of {sdesc}. {pose} {STYLE}'
            tasks.append((out, prompt, None))

    print(f'TOTAL {len(tasks)} images', flush=True)
    batch = []
    for out, prompt, ref_name in tasks:
        batch.append(gen(out, prompt, ref_b64(ref_name) if ref_name else None))
        if len(batch) == 3:
            await asyncio.gather(*batch)
            batch = []
    if batch:
        await asyncio.gather(*batch)
    print('DONE', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
