const { User } = require("../db/models")

const adminAccess = async (req, res, next) => {
  const { userId } = req.params

  try {
    const user = await User.findByPk(userId)

    if(user) {
      if(user.type === "admin") {
        next()
        return
      }

      return res.status(401).json({ message: "Unauthorized" })
    }

    return res.status(404).json({ message: "UserNotFound" })
  } catch (error) {
    return res.status(404).json({ error })
  }
}

module.exports = {
  adminAccess
}