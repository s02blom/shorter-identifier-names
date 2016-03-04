docker rm peter && docker run --name peter -it -p 5000:5000 -v $(pwd):/var/peter --link mongodb:mongodb cessor/peter /bin/bash
