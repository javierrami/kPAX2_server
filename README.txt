% README file
%
% This repo contains the kPAX platform server code
%
% TODO: Inclusion of the files structure


## Start server

You can specify parameters using local environment

MONGODB_URL: the mongodb connection URL

### Execute

```
MONGODB_URL="mongodb://readwrite:1234@ds021462.mlab.com:21462/kpax2" bin/www
```



## Test Endpoints

### list users GET

http://localhost:3000/user/list


### add user POST

http://localhost:3000/user

BODY

```
{
	"login": "drierat@uoc.edu",
	"name": "Daniel Riera"
}
```
RESPONSE

```
{
	"login": "ddrierat@uoc.eduu",
	"name": "Daniel Riera",
	"created_at": "2016-06-08T06:12:45.841Z",
	"updated_at": "2016-06-08T06:12:45.841Z",
	"_id": "5757b75df7752041468230eb"
}
```

### list games GET

http://localhost:3000/game/list


### add game POST

http://localhost:3000/user

BODY

```
{
    "owner_id": "57546d42ff435e591d083d03",
    "name": "game1"
}
```
RESPONSE

```
{
  "name": "game2",
  "owner": "57546d42ff435e591d083d03",
  "status": 0,
  "nlikes": 0,
  "created_at": "2016-06-08T06:25:03.291Z",
  "updated_at": "2016-06-08T06:25:03.291Z",
  "_id": "5757ba3f8d7c2e6c46484ac5"
}
```
