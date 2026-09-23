"""One-off helper: run this locally to generate the ADMIN_PASSWORD_HASH
value for your .env / Railway environment variables. Never commit the
plaintext password anywhere — only the hash this prints goes into the
environment.

Usage:
    python3 setup_admin_password.py
"""
import getpass
from admin_auth import hash_password_for_setup

if __name__ == "__main__":
    pw = getpass.getpass("Choose an admin password: ")
    confirm = getpass.getpass("Confirm password: ")
    if pw != confirm:
        print("Passwords didn't match — try again.")
    else:
        print("\nAdd this to your environment variables as ADMIN_PASSWORD_HASH:\n")
        print(hash_password_for_setup(pw))
