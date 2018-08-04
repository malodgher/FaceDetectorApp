const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    //Validation
    if(!email || !name || !password){
        return res.status(400).json('Incorrect Form Submission');
    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => { //We use transactions here so that if updating the
        //login table fails, nothing in the users table will be updated too
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users').returning('*').insert({ //Returning('*') means it can return all columns 
                email: loginEmail[0], //loginEmail returns array, so must get 1st element
                name: name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]); //In then then, the user value is the array of the single object just created.
                                   //We use res.json(user[0]) to return just that object and not the array of the object
            })
        })
        .then(trx.commit)//Must commit changes in transactions
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('Unable To Register'));
};

module.exports = {
    handleRegister: handleRegister
};