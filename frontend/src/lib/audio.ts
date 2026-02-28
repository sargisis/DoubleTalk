export function playSound(type: 'success' | 'fail' | 'flip') {
    // Determine the online sound file to play
    let url = '';

    switch (type) {
        case 'success':
            url = 'https://actions.google.com/sounds/v1/ui/pop_up_sound.ogg';
            break;
        case 'fail':
            url = 'https://actions.google.com/sounds/v1/water/wood_whip_water.ogg';
            break;
        case 'flip':
            url = 'https://actions.google.com/sounds/v1/ui/button_click.ogg';
            break;
        default:
            return;
    }

    try {
        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.play().catch(err => {
            // Browsers block autoplay without initial interaction
            console.log('Audio playback prevented by browser:', err);
        });
    } catch (e) {
        console.error('Failed to play audio:', e);
    }
}
