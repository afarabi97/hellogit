@load base/protocols/ssl
@load base/files/x509
@load base/utils/directions-and-hosts

module SSL;

export {
  redef record SSL::Info += {
    not_valid_before: time &optional &log;
    not_valid_after: time &optional &log;
  };
}

event ssl_established(c: connection) &priority=3
  {

  if ( ! c$ssl?$cert_chain || |c$ssl$cert_chain| == 0 ||
       ! c$ssl$cert_chain[0]?$x509 || ! c$ssl$cert_chain[0]?$sha1 )
    return;

  local cert = c$ssl$cert_chain[0]$x509$certificate;
  c$ssl$not_valid_before = cert$not_valid_before;
  c$ssl$not_valid_after = cert$not_valid_after;

  }
