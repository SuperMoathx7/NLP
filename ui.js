document.addEventListener('DOMContentLoaded', function() {
    // Add animation to the ask button
    const askButton = document.getElementById('askButton');
    if (askButton) {
        askButton.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-paper-plane"></i> Ask';
            }, 2000);
        });
    }

    // Add floating animation to the response container when new content arrives
    const responseContainer = document.getElementById('response');
    if (responseContainer) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    responseContainer.style.animation = 'fadeInUp 0.4s ease';
                    setTimeout(() => {
                        responseContainer.style.animation = '';
                    }, 400);
                }
            });
        });
        
        observer.observe(responseContainer, { childList: true });
    }
});

// Add to CSS:
