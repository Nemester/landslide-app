document.addEventListener("DOMContentLoaded", function () {
    // Function to handle hiding the alert and progress bar
    function hideAlert(alertElement, progressBar) {
        const alertId = alertElement.id;
        let timeRemaining = 7;  // seconds countdown
        let progress = 100;  // Start progress at 100%

        // Start the countdown and progress bar decrease
        const interval = setInterval(() => {
            if (timeRemaining <= 0) {
                // Hide the alert when time is up
                alertElement.classList.remove('show');
                clearInterval(interval);  // Clear interval when done
            } else {
                timeRemaining -= 0.1;  // Decrease the time remaining by 0.1 second
                progress -= 1;  // Decrease the progress by 1%

                // Update the progress bar width
                progressBar.style.width = progress + "%";
            }
        }, 100);  // Update every 100 ms

        // Pause the countdown and progress bar when mouse hovers over the alert
        alertElement.addEventListener("mouseenter", function () {
            clearInterval(interval);  // Pause interval
        });

        // Resume countdown and progress bar when mouse leaves the alert
        alertElement.addEventListener("mouseleave", function () {
            // Restart the interval from the current time remaining
            hideAlert(alertElement, progressBar);
        });
    }

    // For success message
    const successAlert = document.getElementById("success-alert");
    if (successAlert) {
        const progressBar = successAlert.querySelector(".progress-bar");
        hideAlert(successAlert, progressBar);
    }

    // For error message
    const errorAlert = document.getElementById("error-alert");
    if (errorAlert) {
        const progressBar = errorAlert.querySelector(".progress-bar");
        hideAlert(errorAlert, progressBar);
    }
});