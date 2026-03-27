# Auth — Apuntes

## ¿Por qué el accessToken se pierde al recargar y el refreshToken no?

El `accessToken` se guarda en **memoria** (estado de React). La memoria es volátil — al recargar la página, el estado se resetea y el token desaparece.

El `refreshToken` se guarda en una **cookie**, que el navegador persiste entre recargas.

---

## ¿Por qué el refreshToken va en cookie httpOnly y no en localStorage?

**El problema con localStorage**: cualquier JavaScript en la página puede leerlo.

```js
localStorage.getItem('accessToken') // cualquier script malicioso puede hacer esto
```

Si hay un ataque XSS (alguien inyecta JS en tu app), el atacante roba el token y puede hacerse pasar por el usuario desde cualquier lugar.

**La cookie httpOnly**: el navegador la envía automáticamente en cada request, pero JavaScript no puede leerla. Ni siquiera `document.cookie` la muestra.

| | localStorage | Cookie httpOnly |
|---|---|---|
| JS puede leerlo | ✅ | ❌ |
| Vulnerable a XSS | ✅ | ❌ |
| Se envía automáticamente | ❌ | ✅ |

**¿Por qué el accessToken en memoria?** Tiene vida corta (15 min). Si alguien lo roba, expira rápido. Y en memoria no hay vector de ataque persistente — al cerrar la pestaña desaparece.
