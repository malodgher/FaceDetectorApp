const handleSignin = (req, res, db, bcrypt) => {
    //Validation
    if(!req.body.email || !req.body.password){
        return res.status(400).json('Incorrect Form Submission');
    }
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const validity = bcrypt.compareSync(req.body.password, data[0].hash);
        if(validity) {
            return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0]);
            })
            .catch(err => res.status(400).json('Unable Retrieve User'));
        } else{
            res.status(400).json('Unable To Sign In');
        }
    })
    .catch(err => res.status(400).json('Unable To Sign In'));
}

// res.status(400).json('error logging in'); //Must have status so front-end can know whether an error has occurred

module.exports = {
    handleSignin: handleSignin 
}