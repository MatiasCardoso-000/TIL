interface ErrorMessageInterface {
  message?: string;
  fieldErrors?: Record<string, string[]>;
  variant?: "login" | "register";
}

export default function ErrorMessage({
  message,
  fieldErrors,
  variant = "register",
}: ErrorMessageInterface) {
  return (
    <div role="alert">
      <>
        {variant === "register" ? (
          <>
            {" "}
            <div role="alert" className="til-error">
              {fieldErrors?.password?.map((msg) => (
                <p key={msg} className="til-error__text">
                  {msg}
                </p>
              ))}
              {fieldErrors?.confirmPassword?.map((msg) => (
                <p key={msg} className="til-error__text">
                  {msg}
                </p>
              ))}
              {fieldErrors?.username?.map((msg) => (
                <p key={msg} className="til-error__text">
                  {msg}
                </p>
              ))}

              {fieldErrors?._general?.map((msg) => (
                <p key={msg} className="til-error__text">
                  {msg}
                </p>
              ))}
            </div>
          </>
        ) : (
          <div className="til-error">
            <p className="til-error__text">{message}</p>
          </div>
        )}
      </>
    </div>
  );
}
