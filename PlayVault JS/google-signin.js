// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Handle existing account selection
    const accountOption = document.querySelector('.account-option');
    accountOption.addEventListener('click', function() {
        handleAccountSelection('bhargavshet@kccemsr.edu.in');
    });
    accountOption.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleAccountSelection('bhargavshet@kccemsr.edu.in');
        }
    });

    // Handle "Use another account"
    const anotherAccount = document.querySelector('.another-account');
    anotherAccount.addEventListener('click', showAccountPicker);
    anotherAccount.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            showAccountPicker();
        }
    });

    // Handle privacy links
    const privacyLink = document.querySelector('.privacy-link');
    const tosLink = document.querySelector('.tos-link');

    privacyLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'https://www.geeksforgeeks.org/privacy-policy';
    });

    tosLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'https://www.geeksforgeeks.org/terms-and-conditions';
    });
});

// Handle account selection
function handleAccountSelection(email) {
    console.log('Selected account:', email);
    // Simulate loading state
    showLoadingState();
    
    // Simulate authentication process
    setTimeout(() => {
        // Redirect to GeeksforGeeks after "authentication"
        window.location.href = 'https://www.geeksforgeeks.org';
    }, 1500);
}

// Show account picker
function showAccountPicker() {
    console.log('Opening account picker...');
    // Here you would typically show Google's account picker
    // For demo purposes, we'll just reload the page
    window.location.reload();
}

// Show loading state
function showLoadingState() {
    const container = document.querySelector('.signin-container');
    const loadingHtml = `
        <div class="loading-state">
            <div class="google-logo">
                <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="Google Logo">
            </div>
            <div class="loading-spinner"></div>
        </div>
    `;
    container.innerHTML = loadingHtml;

    // Add loading spinner styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
        }
        
        .loading-spinner {
            margin-top: 32px;
            width: 32px;
            height: 32px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #1a73e8;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}