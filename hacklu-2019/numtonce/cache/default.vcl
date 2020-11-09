vcl 4.0;

import std;
import directors;

backend default {
    .host = "server";
    .port = "80";
    .connect_timeout = 60s;
    .first_byte_timeout = 60s;
    .between_bytes_timeout = 60s;
    .max_connections = 800;
}
 
# ACL we'll use later to allow purges
acl purge {
    "localhost";
    "127.0.0.1";
    "::1";
}
 
sub vcl_backend_response {
    set beresp.ttl = 10m;
}

sub vcl_recv {
    # Allow purging
    if (req.method == "PURGE") {
        if (!client.ip ~ purge) { # purge is the ACL defined at the begining
            # Not from an allowed IP? Then die with an error.
            return (synth(405, "IP: " + client.ip  +  " is not allowed to send PURGE requests."));
        }
        
        # If you got this stage (and didn't error out above), purge the cached result
        return (purge);
    }

    # Only deal with "normal" types
    if (req.method != "GET" &&
        req.method != "HEAD" &&
        req.method != "PUT" &&
        req.method != "POST" &&
        req.method != "TRACE" &&
        req.method != "OPTIONS" &&
        req.method != "PATCH" &&
        req.method != "DELETE") {
        /* Non-RFC2616 or CONNECT which is weird. */
        return (pipe);
    }

    # Only cache static files
    if (req.url !~ "^[^?]*\.(bmp|css|gif|ico|jpeg|jpg|js|png|svg|svgz|webm|webp|woff|woff2|xml)$") {
        return (pass);
    }
    
    # Only cache GET or HEAD requests. This makes sure the POST requests are always passed.
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    return (hash);
}

sub vcl_pipe {
    return (pipe);
}

sub vcl_pass {
    #return (pass);
}

# The data on which the hashing will take place
sub vcl_hash {
    # Called after vcl_recv to create a hash value for the request. This is used as a key
    # to look up the object in Varnish.

    hash_data(req.url);

    if (req.http.host) {
        hash_data(req.http.host);
    } else {
        hash_data(server.ip);
    }
}

# The routine when we deliver the HTTP request to the user
# Last chance to modify headers that are sent to the client
sub vcl_deliver {
    # Called before a cached object is delivered to the client.

    # Add debug header to see if it's a HIT/MISS and the number of hits, disable when not needed
    if (obj.hits > 0) {
        set resp.http.Hit-Or-Miss = "i guess they never miss huh?";
    }

    # Remove some headers: PHP/Express/... version
    unset resp.http.X-Powered-By;

    # Remove some headers: Apache version & OS
    unset resp.http.Server;
    unset resp.http.X-Drupal-Cache;
    unset resp.http.X-Varnish;
    unset resp.http.Via;
    unset resp.http.Link;
    unset resp.http.X-Generator;

    return (deliver);
}
