document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('emailForm');
    const previewBtn = document.getElementById('previewBtn');
    const sendBtn = document.getElementById('sendBtn');
    const previewModal = document.getElementById('previewModal');
    const previewContent = document.getElementById('previewContent');
    const closeBtn = document.querySelector('.close');
    const logSection = document.getElementById('logSection');
    const logOutput = document.getElementById('logOutput');

    // Load recipients from file on page load
    loadRecipients();

    // Preview button
    previewBtn.addEventListener('click', function() {
        const htmlBody = document.getElementById('htmlBody').value;
        const subject = document.getElementById('subject').value;
        
        previewContent.innerHTML = `
            <h3 style="color: #667eea; margin-bottom: 10px;">Subject: ${escapeHtml(subject)}</h3>
            <div style="border-top: 1px solid #ddd; padding-top: 15px;">
                ${htmlBody}
            </div>
        `;
        previewModal.style.display = 'flex';
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        previewModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === previewModal) {
            previewModal.style.display = 'none';
        }
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            smtpHost: document.getElementById('smtpHost').value,
            smtpPort: document.getElementById('smtpPort').value,
            smtpSecure: document.getElementById('smtpSecure').value === 'true',
            smtpUser: document.getElementById('smtpUser').value,
            smtpPass: document.getElementById('smtpPass').value,
            fromAddress: document.getElementById('fromAddress').value,
            subject: document.getElementById('subject').value,
            recipients: document.getElementById('recipients').value,
            htmlBody: document.getElementById('htmlBody').value
        };

        // Validate recipients
        const recipientList = formData.recipients.split('\n').map(r => r.trim()).filter(r => r);
        if (recipientList.length === 0) {
            alert('Please add at least one recipient');
            return;
        }

        // Disable send button
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        // Show log section
        logSection.style.display = 'block';
        logOutput.innerHTML = '';
        addLogEntry('Starting email send process...', 'info');

        try {
            const response = await fetch('/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Check if response is OK before parsing
            if (!response.ok) {
                const errorText = await response.text();
                let errorMsg = `HTTP Error ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMsg = errorJson.error || errorMsg;
                } catch (e) {
                    if (errorText) errorMsg = errorText;
                }
                throw new Error(errorMsg);
            }

            // Get response text first to debug empty responses
            const responseText = await response.text();
            if (!responseText) {
                throw new Error('Empty response from server');
            }

            const result = JSON.parse(responseText);
            result.logs.forEach(log => addLogEntry(log.message, log.type));

        } catch (error) {
            addLogEntry(`Error: ${error.message}`, 'error');
            console.error('Send error:', error);
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Emails';
        }
    });

    function addLogEntry(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = message;
        logOutput.appendChild(entry);
        logOutput.scrollTop = logOutput.scrollHeight;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async function loadRecipients() {
        try {
            const response = await fetch('/recipients');
            if (!response.ok) {
                console.error('Failed to load recipients:', response.status);
                return;
            }
            const responseText = await response.text();
            if (!responseText) {
                console.warn('Empty recipients response');
                return;
            }
            const data = JSON.parse(responseText);
            document.getElementById('recipients').value = data.recipients.join('\n');
        } catch (error) {
            console.error('Could not load recipients:', error);
        }
    }
});
