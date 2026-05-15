document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const action = e.target.innerText;
        console.log(`Action clicked: ${action}`);
        // Add visual click effect
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 150);
    });
});

document.querySelector('.close-icon').addEventListener('click', () => {
    console.log('Close clicked');
    document.querySelector('.party-window').style.display = 'none';
    setTimeout(() => {
        document.querySelector('.party-window').style.display = 'flex';
    }, 1500); // Reappear after 1.5s for prototype purposes
});
