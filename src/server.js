const bodyParser = require("body-parser")
const compression = require("compression")
const express = require("express")
const { default: helmet } = require("helmet")
const morgan = require("morgan")
const cors = require("cors")

const { User, Product } = require("./db/models")
const { adminAccess } = require("./middlewares/AccessMiddleware")

const app = express()
const port = 5000

app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(bodyParser.json({ limit: "30mb" }))
app.use(morgan("dev"))
app.use(compression())
app.use(helmet())
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Server online!" })
})

/* Api Routes */
// Users
app.post("/api/v1/user/register", async (req, res) => {
  const { fullName, email } = req.body

  if(!fullName) return res.status(422).json({ message: "Full Name Required" })
  if(!email) return res.status(422).json({ message: "Email Required" })

  try {
    const users = await User.findAll()

    if(users.length === 0 ) {
      const createNewAdmin = await User.create({ fullName, email, type: "admin" })

      return res.status(201).json({ message: "NewAdminCreated", data: createNewAdmin })
    }

    const createNewUser = await User.create({ fullName, email })

    return res.status(201).json({ message: "NewUserCreated", data: createNewUser })
  } catch (error) {
    return res.status(500).json({ error })
  }
})

// Products
app.get("/api/v1/products", async (req, res) => {
  try {
    const products = await Product.findAll()

    if(products.length <= 0) {
      return res.status(404).json({ message: "Product Not Found" })
    }

    return res.status(200).json({ message: "Product List", data: products })
  } catch (error) {
    return res.status(500).json({ error })
  }
})
app.post("/api/v1/user/:userId/product/create", adminAccess, async (req, res) => {
 const { name } = req.body

 if(!name) return res.status(422).json({ message: "Product Name Required" })

 try {
  const createProduct = await Product.create({ name })

  if(createProduct) {
    return res.status(201).json({ message: "Product Created", data: createProduct })
  }

  return res.status(400).json({ message: "Create Product Failed" })
 } catch (error) {
  return res.status(500).json({ error })
 }
})
app.put("/api/v1/user/:userId/product/:productId/update", adminAccess, async (req, res) => {
 const { name } = req.body
 const { productId } = req.params

 if(!name) return res.status(422).json({ message: "Product Name Required" })

 try {
  const product = await Product.findByPk(productId)

  if(product) {
    await product.update({ name })

    return res.status(200).json({ message: "Product Updated", data: product })
  }

  return res.status(400).json({ message: "Product Not Found" })
 } catch (error) {
  return res.status(500).json({ error })
 }
})
app.delete("/api/v1/user/:userId/product/:productId/delete", adminAccess, async (req, res) => {
 const { productId } = req.params

 try {
  const product = await Product.findByPk(productId)

  if(product) {
    await product.destroy()

    return res.status(200).json({ message: "Product Deleted", data: product })
  }

  return res.status(400).json({ message: "Product Not Found" })
 } catch (error) {
  return res.status(500).json({ error })
 }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})