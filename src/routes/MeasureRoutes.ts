import MeasureController from '../controllers/MeasureController'
import { Router } from 'express'

const route: Router = Router()

route.post('/upload', MeasureController.upload)
route.patch('/confirm', MeasureController.confirm)
route.get('/:customer_code/list', MeasureController.getMeasuresFromCustomer)

export default route
