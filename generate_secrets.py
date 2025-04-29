import random
import string
import os

if __name__ == "__main__":
    with open("database_root_password.txt", "w") as file:
        file.write(''.join([random.choice(string.ascii_letters+string.digits) for _ in range(12)]))