##Tools

###Apache

If some of your custom view's requests need to be handled by [Apache][1], add this to the nginx vhost file.

```bash
# apache
location /some-slug/ {
	proxy_pass http://127.0.0.1:8008/some-slug/;
	proxy_set_header Host $http_host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

Edit `/etc/apache2/ports.conf`.

```bash
# When nginx is set as proxy
NameVirtualHost 127.0.0.1:8008
Listen 127.0.0.1:8008
```

Create apache's virtual host file.

```bash
<VirtualHost 127.0.0.1:8008>
	ServerAdmin admin@localhost
	# apache's vhost name MUST MATCH the nginx's vhost name
	ServerName admin.example.com
	ServerAlias admin.example.com
	# some aliases etc.
	Alias /some-slug /path/to/some/dir
	<Location /some-slug>
		# some options ...
	</Location>
	# log
	ErrorLog /var/log/apache2/admin-error.log
	CustomLog /var/log/apache2/admin-access.log combined
</VirtualHost>
```

  [1]: http://httpd.apache.org/