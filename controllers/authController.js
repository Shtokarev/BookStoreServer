let db = require("../models");
let createToken = require("../modules/createToken");

exports.auth = async (req, res) => {

  let {email, password } = req.body;

  try {
    const foundUser = await db.User.findOne({
      where: {
        email
      }
    });
          
    if(!foundUser) {
      console.error(`No user found, email: ${email}`);
      return res.status(404).json(`Пользователь ${email} не найден`);

    } else {
      console.log(`Found user, id: ${foundUser.id}, full_name: ${foundUser.full_name}`);

      if(foundUser.validPassword(password)) {

        let newAccessToken = createToken(foundUser.id, foundUser.email, foundUser.role);
        let newRefreshToken = createToken(foundUser.id, foundUser.email, foundUser.role, true);
    
        try {
            await foundUser.updateAttributes({
                ref_token: newRefreshToken
            });    
        }
        catch(error) {
            console.error(`Error on update refresh token in db ${error}`);
        }

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.status(201).json(JSON.stringify({  
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          role: foundUser.role,
          full_name: foundUser.full_name,
          address: foundUser.address,
          phone: foundUser.phone
        }));

      } else {
        console.log(`Error checking password`);
        return res.status(401).json(`Неверный пароль`);                    
      }
    }
  }
	catch(err){
		console.error(err.message);
		return res.status(500).json({ error: "Internal server error in api/auth" });
	}
};


exports.refresh = async (req, res) => {

  const header = req.headers.authorization;
  let token;

  if(header) {
    const bearer = header.split(' ');
    token = bearer[1];
  } else {
    console.log("no token in headers in GET");
    return res.sendStatus(404);
  }

  try {
    // find refresh token in db
    const foundUser = await db.User.findOne({
        where: { ref_token: token }, 
        attributes: ["id", "email", "ref_token", "role", "full_name", "address", "phone" ]
    });

    if(!foundUser) {
        console.error(`No user found with token: ${token}`);
        return res.status(404).json(`Refresh token ${token} не найден`);
    }

    let newAccessToken = createToken(foundUser.id, foundUser.email, foundUser.role);
    let newRefreshToken = createToken(foundUser.id, foundUser.email, foundUser.role, true);

    try {
      await foundUser.updateAttributes({
        ref_token: newRefreshToken
      });    
    }
    catch(error) {
      console.error(`Error on update refresh token in db ${error}`);
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(201).json(JSON.stringify({  
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      role: foundUser.role,
      full_name: foundUser.full_name,
      address: foundUser.address,
      phone: foundUser.phone
    }));

  }
  catch(err) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal server error in api/refresh" });
  }
};
