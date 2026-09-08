document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('loginForm');
  if(!form)return;
  const msg=document.getElementById('loginMessage');
  const button=document.getElementById('loginButton');
  const buttonText=document.getElementById('loginButtonText');
  const buttonLoader=document.getElementById('loginButtonLoader');
  const toggle=document.getElementById('togglePassword');
  const password=document.getElementById('password');

  toggle?.addEventListener('click',()=>{
    const visible=password.type==='text';
    password.type=visible?'password':'text';
    toggle.setAttribute('aria-pressed',String(!visible));
    toggle.setAttribute('aria-label',visible?'Show password':'Hide password');
  });

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(msg)msg.hidden=true;
    if(button)button.disabled=true;
    if(buttonText)buttonText.hidden=true;
    if(buttonLoader)buttonLoader.hidden=false;
    try{
      const identifier=document.getElementById('identifier').value.trim();
      const passwordValue=password.value;
      if(!identifier||!passwordValue)throw new Error('Enter your mobile/email and password.');
      if (!window.auth) throw new Error('Authentication module failed to load. Please hard-refresh the page.');
      await window.auth.login(identifier,passwordValue);
      window.auth.redirectToDashboard();
    }catch(err){
      if(msg){msg.textContent=err.message||'Unable to sign in';msg.className='login-message error';msg.hidden=false}
    }finally{
      if(button)button.disabled=false;
      if(buttonText)buttonText.hidden=false;
      if(buttonLoader)buttonLoader.hidden=true;
    }
  });
});
