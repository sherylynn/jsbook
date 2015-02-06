//来个事件：
$("#inputPassword").click( function () {
	$('label[for=inputPassword]').parent().addClass('has-error');
});