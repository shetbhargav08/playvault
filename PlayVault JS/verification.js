// Global variables for DOM elements
let loginModal;
let emailContainer;
let verificationContainer;
let mobileInput;
let emailInput;
let emailSubmitBtn;
let mobileSubmitBtn;

// Initialize after DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize DOM elements
    loginModal = document.getElementById('loginModal');
    emailContainer = document.getElementById('emailContainer');
    verificationContainer = document.getElementById('verificationContainer');
    mobileInput = document.getElementById('mobileInput');
    emailInput = document.getElementById('emailInput');
    emailSubmitBtn = document.getElementById('emailSubmitBtn');
    mobileSubmitBtn = document.getElementById('mobileSubmitBtn');

    // Set up event listeners for mobile, email, and OTP inputs
    setupMobileInputListeners();
    setupEmailInputListeners();
    setupOTPInputListeners();
});

// Mobile input handling
function setupMobileInputListeners() {
    // Display submit button when the mobile input field is focused
    mobileInput.addEventListener('focus', function () {
        mobileSubmitBtn.style.display = 'block';
        mobileSubmitBtn.style.backgroundColor = '#e0e0e0';
        mobileSubmitBtn.disabled = true;  // Initially disable the submit button
    });

    // Handle mobile input to allow only numeric characters and validate length
    mobileInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');  // Remove non-numeric characters

        // Enable the submit button when the input length is exactly 10 digits
        if (this.value.length === 10) {
            mobileSubmitBtn.style.backgroundColor = '#333';
            mobileSubmitBtn.disabled = false;
        } else {
            mobileSubmitBtn.style.backgroundColor = '#e0e0e0';
            mobileSubmitBtn.disabled = true;
        }
    });

    // Hide submit button if input is blurred and the length is incorrect
    mobileInput.addEventListener('blur', function () {
        if (mobileInput.value.length !== 10) {
            mobileSubmitBtn.style.display = 'none';
        }
    });

    // Handle mobile submit button click, transitioning to OTP verification
    mobileSubmitBtn.addEventListener('click', function () {
        if (mobileInput.value.length === 10) {
            showVerificationPage('mobile', mobileInput.value);  // Show OTP page for mobile number
        }
    });
}

// Email input handling
function setupEmailInputListeners() {
    // Validate email format and enable/disable submit button accordingly
    emailInput.addEventListener('input', function () {
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);  // Simple email regex validation
        emailSubmitBtn.disabled = !isValidEmail;
        emailSubmitBtn.style.backgroundColor = isValidEmail ? '#333' : '#e0e0e0';  // Update button style
    });

    // Handle email submit button click, transitioning to OTP verification
    emailSubmitBtn.addEventListener('click', function() {
        if (!emailSubmitBtn.disabled) {
            showVerificationPage('email', emailInput.value);  // Show OTP page for email
        }
    });
}

// OTP input handling
function setupOTPInputListeners() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const verifyButton = document.querySelector('.verify-continue-button');

    otpInputs.forEach((input, index) => {
        // Handle OTP input and automatically focus on the next input
        input.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');  // Allow only numeric input

            if (this.value) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();  // Focus on next input when a digit is entered
                }
            }

            checkOTPCompletion(otpInputs, verifyButton);  // Check if OTP is complete
        });

        // Handle backspace to focus on the previous input
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                otpInputs[index - 1].focus();  // Focus previous input when backspace is pressed
            }
        });

        // Handle paste event and fill OTP inputs accordingly
        input.addEventListener('paste', function (e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text');
            const numbers = pastedData.match(/\d/g);  // Extract numeric digits

            if (numbers) {
                numbers.forEach((num, idx) => {
                    if (idx < otpInputs.length) {
                        otpInputs[idx].value = num;  // Fill OTP inputs with pasted numbers
                    }
                });

                checkOTPCompletion(otpInputs, verifyButton);  // Check OTP completion
                otpInputs[Math.min(numbers.length, otpInputs.length) - 1].focus();  // Focus the last filled input
            }
        });
    });
}

// Helper function to check OTP completion and enable the verify button
function checkOTPCompletion(otpInputs, verifyButton) {
    const otpValue = Array.from(otpInputs).map(input => input.value).join('');  // Join all OTP input values
    const isComplete = otpValue.length === otpInputs.length;  // Check if all OTP fields are filled

    verifyButton.disabled = !isComplete;  // Disable or enable verify button based on OTP completion
    verifyButton.style.backgroundColor = isComplete ? '#333' : '#e0e0e0';  // Change button color
}

// Helper function to format phone number (for display in verification)
function formatPhoneNumber(number) {
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;  // Format the number as +91 XXXXX XXXXX
}

// Modal control functions
function openLoginModal() {
    loginModal.style.display = 'flex';  // Show login modal
    document.body.style.overflow = 'hidden';  // Prevent page scrolling when modal is open
}

function closeLoginModal() {
    if (event.target === loginModal) {
        return; // Prevent closing when clicking outside the modal
    }
    loginModal.style.display = 'none';  // Close login modal
    document.body.style.overflow = 'auto';  // Allow page scrolling
    resetAllForms();  // Reset all forms inside the modal
}

// Show the email login page (switch from main login page)
function showEmailPage() {
    document.querySelector('.login-container').style.display = 'none';
    emailContainer.style.display = 'block';  // Show email login form
    emailInput.focus();  // Focus on email input
}

// Show main login page (back from email or verification page)
function showMainLogin() {
    document.querySelector('.login-container').style.display = 'block';  // Show main login form
    emailContainer.style.display = 'none';  // Hide email form
    verificationContainer.style.display = 'none';  // Hide verification form
    resetAllForms();  // Reset all input fields and buttons
}

// Show the OTP verification page (either for email or mobile)
function showVerificationPage(type, value) {
    document.querySelector('.login-container').style.display = 'none';
    emailContainer.style.display = 'none';
    verificationContainer.style.display = 'block';  // Show verification page

    // Update the title and subtitle based on the type (email or mobile)
    const verificationTitle = document.querySelector('.verification-title');
    const verificationSubtitle = document.querySelector('.verification-subtitle');

    if (type === 'email') {
        verificationTitle.textContent = 'Verify your Email';
        verificationSubtitle.innerHTML = `Enter OTP sent to <br><strong>${value}</strong>`;  // Email verification message
    } else {
        verificationTitle.textContent = 'Verify your Mobile Number';
        const formattedNumber = formatPhoneNumber(value);  // Format mobile number
        verificationSubtitle.innerHTML = `Enter OTP sent to <br><strong>${formattedNumber}</strong>`;  // Mobile verification message
    }

    // Reset and focus OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => input.value = '');  // Clear all OTP inputs
    otpInputs[0].focus();  // Focus on the first OTP input

    // Reset verify button
    const verifyButton = document.querySelector('.verify-continue-button');
    verifyButton.disabled = true;
    verifyButton.style.backgroundColor = '#e0e0e0';  // Disable verify button initially
}

// Utility function to reset all forms (mobile, email, OTP)
function resetAllForms() {
    // Reset mobile form
    mobileInput.value = '';
    mobileSubmitBtn.style.display = 'none';
    mobileSubmitBtn.style.backgroundColor = '#e0e0e0';
    mobileSubmitBtn.disabled = true;

    // Reset email form
    emailInput.value = '';  
    emailSubmitBtn.disabled = true;
    emailSubmitBtn.style.backgroundColor = '#e0e0e0';

    // Reset OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => input.value = '');

    // Reset verify button
    const verifyButton = document.querySelector('.verify-continue-button');
    verifyButton.disabled = true;
    verifyButton.style.backgroundColor = '#e0e0e0';
}

// Handle resend OTP button click (add resend logic here)
document.querySelector('.resend-button').addEventListener('click', function() {
    // Add your resend OTP logic here
    console.log('Resending OTP...');
});

// Handle final verification button click (verify OTP logic here)
document.querySelector('.verify-continue-button').addEventListener('click', function() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');  // Get the OTP entered

    // Add your OTP verification logic here
    console.log('Verifying OTP:', otp);
});
