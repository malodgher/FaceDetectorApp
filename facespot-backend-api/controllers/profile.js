const handleProfile = (req, res, db) => {
    const { id } = req.params;
    db.select('*').from('users').where({
        id: id
    }).then(user => {  //User can return an empty array if the ID requested doesn't exist
        if(user.length) { //If the length of the user array is 1 or more, then return user
            res.json(user[0]);
        } else{ //If it is zero, return status
            res.status(400).json('Not Found'); //Must have status to let front end know a bad request has been made
        }
    }).catch(err => res.status(400).json('Error Getting User'));
}

module.exports = {
    handleProfile: handleProfile
}