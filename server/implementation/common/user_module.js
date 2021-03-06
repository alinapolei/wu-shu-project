async function checkUserDetailsForLogin(userData) {
    var ans = new Object();
    await dbUtils.sql(`select * from user_Passwords where id = @id`)
        .parameter('id', tediousTYPES.Int, userData.userID)
        .execute()
        .then(function (results) {
            if (results.length === 0) {
                ans.isPassed = false;
                ans.err = Constants.errorMsg.errLoginDetails
            } else {
                ans.dbResults = results[0];
                ans.isPassed = bcrypt.compareSync(userData.password, results[0].password);
            }
        }).fail(function (err) {
            ans.isPassed = false;
            ans.err = err;
        });
    return ans;

}

async function getUserDetails(userData) {
    let result;
    switch (userData.dbResults.usertype) {
        case 1:
            result = await dbUtils.sql(`select firstname, lastname from user_Manger where id= '${userData.dbResults.id}'`).execute();
            break;
        case 2:
            result = await dbUtils.sql(`select firstname, lastname from user_Coach where id= '${userData.dbResults.id}'`).execute();
            break;
        case 3:
            result = await dbUtils.sql(`select firstname, lastname from user_Sportsman where id= '${userData.dbResults.id}'`).execute();
            break;
    }
    return result[0]

}

function buildToken(userDetails, userData) {
    payload = {id: userData.dbResults.id, name: userDetails.firstname, access: userData.dbResults.usertype};
    options = {expiresIn: "1d"};
    const token = jwt.sign(payload, secret, options);
    return {
        'token': token,
        'id': userData.dbResults.id,
        'firstname': userDetails.firstname,
        'lastname': userDetails.lastname,
        'access': userData.dbResults.usertype,
        'isFirstTime': userData.dbResults.isfirstlogin
    };
}

function getTabelName(userType) {
    switch (userType) {
        case 1:
            return "user_Manger";
        case 2:
            return "user_Coach";
        case 3:
            return "user_Sportsman"
    }
}

async function uploadeProfilePic(tblName, id) {
    let ans = new Object();
    await dbUtils.sql(`UPDATE @tblName SET picture ='${"./resources/profilePic/" + id + ".jpeg"}' WHERE id = @id;`)
        .parameter('id', tediousTYPES.Int, id)
        .parameter('tblName', tediousTYPES.Text, tblName)
        .execute()
        .then(function (results) {
            ans.isPassed = true;
            ans.results = Constants.msg.profilePicUpdate;
        }).fail(function (err) {
            ans.isPassed = false;
            ans.results = err;
        });

    return ans;
}

async function validateDiffPass(userData) {
    var ans = new Object()
    await dbUtils.sql(`Select password from user_Passwords where id= @id`)
        .parameter('id', tediousTYPES.Int, userData.id)
        .execute()
        .then(function (results) {
            if(bcrypt.compareSync(userData.newPass, results[0].password)) {
                ans.status = Constants.statusCode.Conflict;
                ans.isPassed = false;
                ans.err = Constants.errorMsg.samePassword
            }
            else{
                ans.status = Constants.statusCode.ok;
                ans.isPassed = true;
                ans.err = results
            }
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.isPassed = false;
            ans.err = err
        });
    return ans;
}

async function changeUserPassword(userData) {
    let ans = new Object();
    await dbUtils.sql(`UPDATE user_Passwords SET password = @newPassword, isFirstLogin = 0 where id =@id`)
        .parameter('newPassword', tediousTYPES.NVarChar, bcrypt.hashSync(userData.newPass, saltRounds))
        .parameter('id', tediousTYPES.Int, userData.id)
        .execute()
        .then(function (results) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.passUpdated
        }).fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err
        });
    return ans

}


async function deleteSportsman(sportsmanId) {
    let ans = new Object();
    let trans;
    await dbUtils.beginTransaction()
        .then(async function (newTransaction) {
            trans = newTransaction;
            return await trans.sql(`DELETE FROM sportsman_sportStyle WHERE id = @sportsmanId;`)
                .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM sportsman_coach WHERE idSportman = @sportsmanId;`)
                .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Passwords WHERE id = @sportsmanId;`)
                .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM sportman_files WHERE id = @sportsmanId;`)
                .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM competition_sportsman WHERE idSportsman = @sportsmanId;`)
                .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM sportsman_sportStyle WHERE id = @sportsmanId;`)
                .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            return await trans.sql(`DELETE FROM user_Sportsman WHERE id = @sportsmanId;`)
                .parameter('sportsmanId', tediousTYPES.Int, sportsmanId)
                .returnRowCount()
                .execute();
        })
        .then(async function (testResult) {
            ans.status = Constants.statusCode.ok;
            ans.results = Constants.msg.userDeleted;
            trans.commitTransaction();
        })
        .fail(function (err) {
            ans.status = Constants.statusCode.badRequest;
            ans.results = err;
            trans.rollbackTransaction();
        })
    return ans;
}

module.exports.buildToken = buildToken;
module.exports.checkUserDetailsForLogin = checkUserDetailsForLogin;
module.exports.getUserDetails = getUserDetails;
module.exports.uploadeProfilePic = uploadeProfilePic;
module.exports.changeUserPassword = changeUserPassword;
module.exports.deleteSportsman = deleteSportsman;
module.exports.validateDiffPass = validateDiffPass;
module.exports.getTabelName=getTabelName;