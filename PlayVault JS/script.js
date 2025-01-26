// Modal Functions
// This function is used to open or display the login modal.
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}
// This function is used to close or hide the login modal.
function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    resetForms();
}

// -------------------------- SIGN-IN CONTAINER FUNCTIONS -------------------------- //
// This function is used to show the mobile number page and hide the email page.
function showEmailPage() {
    document.querySelector('.login-container').style.display = 'none'; // Hide the sign-in container (mobile login).
    document.getElementById('emailContainer').style.display = 'block'; // Show the email container.
}

// This function is used to show the main login page (mobile number input) and hide the email page.
function showMainLogin() {
    document.querySelector('.login-container').style.display = 'block'; // Show the sign-in container (mobile login).
    document.getElementById('emailContainer').style.display = 'none'; // Hide the email container.
    resetForms();
}

// This function is used to reset the input fields and hide the submit buttons for both mobile and email inputs.
function resetForms() {
    // Reset mobile input
    document.getElementById('mobileInput').value = ''; // Clear the mobile input field
    document.getElementById('mobileSubmitBtn').style.display = 'none'; // Hide the mobile submit button
    document.getElementById('mobileSubmitBtn').disabled = true; // Disable the mobile submit button
    
    // Reset email input
    document.getElementById('emailInput').value = ''; // Clear the email input field
    document.getElementById('emailSubmitBtn').disabled = true; // Disable the email submit button
}

// Close modal if clicked outside
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}

// -------------------------- MOBILE NUMBER VALIDATION -------------------------- //
// Form validation and continue button handling for mobile number
document.addEventListener('DOMContentLoaded', function() { 
    // Mobile number validation
    const mobileInput = document.getElementById('mobileInput');
    const mobileSubmitBtn = document.getElementById('mobileSubmitBtn');
    
    // Show the "Continue" button when the input field is focused (tap on it)
    mobileInput.addEventListener('focus', function () {
        mobileSubmitBtn.style.display = 'inline-block'; // Show the mobile submit button
        mobileSubmitBtn.disabled = true; // Initially disable the button (grey color)
    });

    // Hide the "Continue" button when the input field loses focus
    mobileInput.addEventListener('blur', function () {
        // Hide the button if input is not valid (less than 10 digits)
        if (mobileInput.value.length !== 10) {
            mobileSubmitBtn.style.display = 'none';
        }
    });

    // Handle mobile input changes and validate input
    mobileInput.addEventListener('input', function() {
        // Remove any non-numeric characters from the input field
        this.value = this.value.replace(/\D/g, '');
        
        // Show/hide and enable/disable the button based on the number of digits entered
        if (this.value.length === 10) {
            mobileSubmitBtn.style.backgroundColor = '#333'; // Set the button color to black when 10 digits are entered
            mobileSubmitBtn.disabled = false; // Enable the submit button
        } else if (this.value.length > 0 && this.value.length < 10) {
            mobileSubmitBtn.style.backgroundColor = '#e0e0e0'; // Set the button color to grey when less than 10 digits
            mobileSubmitBtn.disabled = true; // Keep button disabled until 10 digits are entered
        }
    });

    // Handle mobile submit button click
    mobileSubmitBtn.addEventListener('click', function() {
        if (mobileInput.value.length === 10) {
            console.log('Mobile number submitted:', mobileInput.value);
            // Add your mobile submission logic here
        }
    });

    // Add enter key support for the mobile input field
    mobileInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !mobileSubmitBtn.disabled) {
            mobileSubmitBtn.click(); // Trigger submit when enter key is pressed and button is enabled
        }
    });
});

// -------------------------- EMAIL VALIDATION -------------------------- //
// Form validation and continue button handling for email input
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('emailInput');
    const emailSubmitBtn = document.getElementById('emailSubmitBtn');

    // Function to validate email format using regular expression
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email validation
        return re.test(email.toLowerCase()); // Return true if email is valid, false otherwise
    }

    // Handle email input changes and validate email
    emailInput.addEventListener('input', function() {
        const isValid = validateEmail(this.value);
        emailSubmitBtn.disabled = !isValid; // Disable the button if the email is not valid
    });

    // Handle email submit button click
    emailSubmitBtn.addEventListener('click', function() {
        if (validateEmail(emailInput.value)) {
            console.log('Email submitted:', emailInput.value);
            // Add your email submission logic here
        }
    });

    // Add enter key support for the email input field
    emailInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !emailSubmitBtn.disabled) {
            emailSubmitBtn.click(); // Trigger submit when enter key is pressed and button is enabled
        }
    });
});
