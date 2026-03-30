import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Define the email parameters
from_address = "omotayoolaolekan01@gmail.com"

# Read recipient emails from file
with open("recipients.txt", "r") as f:
    to_addresses = [line.strip() for line in f if line.strip()]

# SMTP server details (replace with your actual SMTP server)
smtp_server = "smtp.gmail.com"  # Example: Mailtrap for testing
smtp_port = 465  # Common SMTP port for secure email submission
smtp_user = "omotayoolaolekan01@gmail.com"      # Replace with your SMTP username
smtp_password = "eftf puoi ylmh csph"  # Replace with your SMTP password

# HTML content of the email
html_body = """
<html>
  <head></head>
  <body>
    <p><strong>Dear User,</strong></p>
    <p>You need to <strong>reset your password immediately</strong> to secure your account.</p>
    <p><button type="submit" style="background-color: yellow;">
      <a href="https://google.com" style="color: blue; font-weight: bold; text-decoration: none;">Click Here</a></button>
    </p>
    <p>This link will expire in 24 hours.</p>
    <p>Best regards,<br>
       <em>Your IT Team</em>
    </p>
  </body>
</html>
"""

# Connect to the SMTP server and send the email
server = None
try:
    # Initialize connection to the SMTP server (SSL for port 465)
    server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10)

    # Login to the SMTP server
    server.login(smtp_user, smtp_password)

    # Send individual emails to each recipient (BCC - they won't see each other)
    for to_address in to_addresses:
        # Create a fresh message for each recipient
        msg = MIMEMultipart("alternative")
        msg["From"] = from_address
        msg["To"] = to_address
        msg["Subject"] = "Important Security Alert"
        
        # Attach HTML content
        msg.attach(MIMEText(html_body, "html"))
        
        # Send the email
        server.sendmail(from_address, [to_address], msg.as_string())
        print(f"Sent to {to_address}")

    print("All emails sent successfully!")

except Exception as e:
    # Print error message if something goes wrong
    print(f"Failed to send email: {e}")

finally:
    # Close the connection
    if server:
        server.quit()