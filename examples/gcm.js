var spew = require("../spew.js");

spew.setLogLevel(10);
spew.init("Example starting up...");

// This is a FAKE API key! Generate a proper one at https://code.google.com/apis/console
spew.getChannel("gcm").setup("AIzaSyDcSyCv5DGy8-Rn2RUuURv2n6l-i3yZn6o");

spew.enableChannel("gcm");

// This is a FAKE registration id! You must receive and store these yourself
spew.regIds.push("MAMSD1bEM3dd4gy_MroibDuf7PWePtXRXVxM1Oq_bJHbpvT6xLTQE8ifycmOlkssdfnJlv2TyBnI_sqOmeHHDsksmasndnfDHxp8rqba0u2P9vSTAXw_lZkg3L5buobgExpryg5abADGqsnkyYMgfakskdz06l_VdhA");

spew.info("You should get this on your phone!"); // Also on the console :)