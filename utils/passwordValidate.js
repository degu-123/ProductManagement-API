const isStrongPassword = (value) => {
  return (
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[!@#$%&*|?><+/]/.test(value) &&
    !/\s/.test(value)
  );
};
function isDigit(value){
  return(/^[0-9]+$/.test(value)
    )
}
module.exports={isStrongPassword,isDigit};