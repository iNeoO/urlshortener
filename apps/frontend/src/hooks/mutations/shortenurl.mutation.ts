import { useMutation } from "@tanstack/react-query";
import { createShortenUrl } from "../../libs/api/shortenurl.api";

export const useCreateShortenUrl = () =>
	useMutation({
		mutationKey: ["shortenurl", "create"],
		mutationFn: createShortenUrl,
	});
