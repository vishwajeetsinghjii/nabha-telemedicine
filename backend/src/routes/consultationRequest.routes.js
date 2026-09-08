const express=require('express');
const router=express.Router();
const c=require('../controllers/consultationRequest.controller');
const {requireAuth}=require('../middleware/auth.middleware');
const {requireRole}=require('../middleware/role.middleware');

router.use(requireAuth);
router.post('/',requireRole('PATIENT','ASHA','ADMIN'),c.create.bind(c));
router.get('/mine',requireRole('PATIENT'),c.patientList.bind(c));
router.get('/admin',requireRole('ADMIN'),c.adminList.bind(c));
router.get('/doctors',requireRole('ADMIN'),c.doctors.bind(c));
router.post('/:id/assign',requireRole('ADMIN'),c.assign.bind(c));
router.post('/:id/accept',requireRole('DOCTOR'),c.accept.bind(c));
router.post('/:id/decline',requireRole('DOCTOR'),c.decline.bind(c));

module.exports=router;
