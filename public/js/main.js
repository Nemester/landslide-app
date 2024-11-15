// JavaScript to automatically dismiss the alert after X seconds
const alert = document.getElementById('success-alert');
const progressBar = document.getElementById('progress-bar');
const duration = 5000; // Duration in milliseconds (e.g., 5000ms = 5 seconds)

if (alert) {
    // Start the progress bar width at 100% and decrease over time
    progressBar.style.width = '100%';
    progressBar.style.transitionDuration = duration + 'ms';
    progressBar.style.width = '0%';

    // Set a timeout to dismiss the alert after the specified duration
    setTimeout(() => {
        alert.classList.remove('show'); // Hide the alert visually
        alert.classList.add('fade'); // Optional: add fade effect for dismissal
    }, duration);
}