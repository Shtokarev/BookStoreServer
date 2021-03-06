let db = require("../models");

// add books to cart
//curl -v --header "Content-Type: application/json" -H "authorization:Bearer eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NDQ4ODQ1MjI3MzIsImlkIjo0LCJyb2xlIjoidXNlciIsImVtYWlsIjoidGVtcEBnbWFpbC5jb20ifQ.Q7_KlBWCjNiLvb10E1KWuvEWmgLPqTQpR3OvL5oWzDg" --request POST --data '{"title":"Метро чегототам","author":"Дмитрий Глуховский","price":"5.95","rank":"two","category":"4","description":"Третья мировая стерла человечество с лица Земли. Планета опустела. Мегаполисы обращены в прах и пепел. Железные дороги ржавеют. Спутники одиноко болтаются на орбите. Радио молчит на всех частотах. Выжили только те, кто, услышав сирены тревоги, успел добежать до дверей московского метро. Там, на глубине в десятки метров, на станциях и в туннелях, люди пытаются переждать конец света. Там они создали себе новый мирок вместо потерянного огромного мира..."}' http://localhost:3000/cart
exports.favorite_add = async function(req, res) {
  
	try {
		const cartDb = await db.Order.findOrCreate({
      where: {
        status: "favorite",
        user_id: req.userId
      },
      include : [{
        model: db.Book,
        attributes: ["id"],
      }]
		});

    if(!cartDb[0]) {
			console.log(`Error find or create favorite for ${req.userId}`);
			return res.status(500).send("Error on create new item in favorite");
    }
    
    await cartDb[0].addBooks(req.body.id);

		console.log(`New book ${req.body.id}, in cart user ${req.userId} has been created.`);
    return res.sendStatus(201);
  
  }
	catch(err) {
		console.error(err);
		return res.status(500).send("Error on create new item in favorite");
	}
};

exports.favorite_delete = async function(req, res) {

	try {
		const cartDb = await db.Order.findAll({
      where: {
        status: "favorite",
        user_id: req.userId
      },
      include : [{
        model: db.Book,
        attributes: ["id"],
      }]
		});

    if(!cartDb[0]) {
			console.log(`Error find favorite for ${req.userId}`);
			return res.status(500).send("Error on create new item in favorite");
    }
    
    await cartDb[0].removeBooks([req.params.id]);
    
		console.log(`Remove book ${req.body.id}, in favorite user ${req.userId} successfully.`);
    return res.sendStatus(201);
  
  }
	catch(err) {
		console.error(err);
		return res.status(500).send("Error on create new item in favorite");
	}
};

exports.favorite_clear = async function(req, res) {
  try {
    const cartDb = await db.Order.findAll({
      where: {
        status: "favorite",
        user_id: req.userId
      },
      include : [{
        model: db.Book,
        attributes: ["id"],
      }]
    });

    if(!cartDb[0]) {
      console.log(`Error find favorite for ${req.userId}`);
      return res.status(500).send("Error on create new item in favorite");
    }

    await cartDb[0].removeBooks([...cartDb[0].Books]);
    
    console.log(`Remove all book, in favorite user ${req.userId} successfully.`);
    return res.sendStatus(201);
  
  }
  catch(err) {
    console.error(err);
    return res.status(500).send("Error on create new item in favorite");
  }
};
