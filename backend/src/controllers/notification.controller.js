const repo=require('../repositories/notification.repository');
async function list(req,res,next){try{return res.json({success:true,data:await repo.listForUser(req.user.id)})}catch(e){next(e)}}
async function markRead(req,res,next){try{const n=await repo.markRead(req.params.id,req.user.id);if(!n)return res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'Notification not found'}});return res.json({success:true,data:n})}catch(e){next(e)}}
module.exports={list,markRead};
