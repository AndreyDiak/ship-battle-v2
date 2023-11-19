export const classNames = (...classes: (string | undefined | boolean)[]) =>
	classes.filter(Boolean).join(' ');
