
# kPAX2_server

This is the kPAX2 server running by default in port 8081

## Execute

### Download

The easiest way for download the server is by cloning the GIT repository:

```bash
$ git clone https://github.com/drierat/kPAX2_server.git
```

For working in the `devel` branch we specify it: 

```bash
$ git checkout devel
```

### Run the server

Execute the server from the `server/` directory.

You can specify parameters using local environment

1. MONGODB_URL: the mongodb connection URL
2. DEBUG: the prefix for debugin (ex. DEBUG=app*)

For stating the server:

```bash
$ MONGODB_URL="mongodb://readwrite:1234@ds021462.mlab.com:21462/kpax2" bin/www
```

For stating the server with debug

```bash
$ DEBUG=* MONGODB_URL="mongodb://readwrite:1234@ds021462.mlab.com:21462/kpax2" bin/www
```

### Change the port  number

For changing the port number edit the file `server/bin/www`

## API

TODO
