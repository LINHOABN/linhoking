import styles from "./Button.module.css";

const VARIANT_CLASS = {
  primary: styles.primary,
  outline: styles.outline,
  ghost: styles.ghost,
  danger: styles.danger,
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  as: Component = "button",
  className = "",
  ...rest
}) {
  const classes = [
    styles.button,
    VARIANT_CLASS[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      {Icon && iconPosition === "left" && <Icon size={17} strokeWidth={2} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={17} strokeWidth={2} />}
    </Component>
  );
}
