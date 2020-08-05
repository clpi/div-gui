if [ "$1" == "kill" ]; then
    kill -9 $(lsof -t -i:5000)
fi

