$(document).ready(function(){
paint_pnl()

})
function paint_pnl() {
box_pnl=$(".box_pnl");
val_pnl=$(".val_pnl").html();
val_pnl=val_pnl.replace('$ ', '');
test=Math.sign(val_pnl);
if (test==-1) {
box_pnl.toggleClass('bg-grow-early bg-love-kiss');
}
}