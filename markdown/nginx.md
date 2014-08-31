
## Tools

### NginX

You can serve all your static files with [NginX][1]

```bash
server {
	listen 80;
	
	# vhost
	server_name admin.example.com;
	
	#log
	access_log /var/log/nginx/admin-access.log;
	error_log /var/log/nginx/admin-error.log debug;

	# NODE
	location / {
		proxy_pass http://127.0.0.1:3000;
		proxy_set_header Host $http_host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	}

	# NGINX

	# static
	location ~ \.(jpg|jpeg|png|gif|swf|flv|mp4|mov|avi|wmv|m4v|mkv|ico|css|js|txt|html|htm)$ {
		root /;
		try_files
			# express admin
			/absolute/path/to/express-admin/public/$uri

			# custom views
			/absolute/path/to/your/project/custom/app1/public/$uri
			/absolute/path/to/your/project/custom/app2/public/$uri
		/;
	}

	# LIBS

	# csslib
	location ^~ /csslib/ {
		alias /absolute/path/to/express-admin/node_modules/express-admin-static/csslib/;
	}
	# jslib
	location ^~ /jslib/ {
		alias /absolute/path/to/express-admin/node_modules/express-admin-static/jslib/;
	}
	# bootswatch
	location ^~ /bootswatch/ {
		alias /absolute/path/to/express-admin/node_modules/express-admin-static/bootswatch/;
	}
}
```


  [1]: http://nginx.org/en/
