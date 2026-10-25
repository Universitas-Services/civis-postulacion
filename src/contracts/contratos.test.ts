import { describe, expect, it } from "vitest";
import {
  codigoVerificacionSchema,
  descargoSchema,
  normalizarTelefono,
  registroCuentaSchema,
  TELEFONO_VE,
} from "./index";

const registro = {
  firstName: "Lucía",
  lastName: "Fernández",
  email: "Lucia@Correo.test",
  password: "ClaveSegura123",
  confirmPassword: "ClaveSegura123",
};

describe("registro de cuenta", () => {
  it("acepta datos válidos y normaliza el correo", () => {
    const r = registroCuentaSchema.safeParse(registro);
    expect(r.success).toBe(true);
    expect(r.data?.email).toBe("lucia@correo.test");
  });

  it("exige una clave fuerte y que coincida", () => {
    expect(
      registroCuentaSchema.safeParse({ ...registro, password: "debil", confirmPassword: "debil" })
        .success,
    ).toBe(false);
    expect(
      registroCuentaSchema.safeParse({ ...registro, confirmPassword: "OtraClave12345" }).success,
    ).toBe(false);
  });

  it("rechaza nombres con números", () => {
    expect(registroCuentaSchema.safeParse({ ...registro, firstName: "Luc1a" }).success).toBe(false);
  });

  it("el código de verificación tiene 6 dígitos", () => {
    expect(codigoVerificacionSchema.safeParse("123456").success).toBe(true);
    expect(codigoVerificacionSchema.safeParse("12345").success).toBe(false);
    expect(codigoVerificacionSchema.safeParse("12a456").success).toBe(false);
  });
});

describe("descargo", () => {
  it("pide título y una descripción con contenido", () => {
    expect(
      descargoSchema.safeParse({
        title: "Mi respuesta",
        description: "La objeción no procede porque…",
      }).success,
    ).toBe(true);
    expect(descargoSchema.safeParse({ title: "Ok", description: "corto" }).success).toBe(false);
  });
});

describe("teléfono venezolano", () => {
  it("normaliza +58 y valida el formato nacional", () => {
    expect(normalizarTelefono("+58 414-123.45.67")).toBe("04141234567");
    expect(TELEFONO_VE.test("04141234567")).toBe(true);
    expect(TELEFONO_VE.test("04131234567")).toBe(false);
  });
});
