import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
	it("merges class names", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("handles conditional classes", () => {
		expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
		expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
	});

	it("merges Tailwind classes correctly", () => {
		// twMerge should keep the last conflicting class
		expect(cn("px-2", "px-4")).toBe("px-4");
		expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
	});

	it("handles arrays and objects", () => {
		expect(cn(["foo", "bar"])).toBe("foo bar");
		expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
	});

	it("handles undefined and null", () => {
		expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
	});
});
