import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type { GetInvitationsQuery } from "@urlshortener/common/types";
import { useEffect, useMemo, useState } from "react";
import { GroupHeader } from "../../components/group/group-header";
import { InvitationsTable } from "../../components/group/invitations.table";
import { ErrorMessage } from "../../components/ui/error-message";
import {
	useAcceptInvitation,
	useInvitations,
	useRefuseInvitation,
} from "../../hooks/query/invitations.hook";
import { useDebounce } from "../../hooks/useDebounce.hook";
import { queryClient } from "../../libs/queryClient";
import { ALLOWED_INVITATION_SORTS } from "../../utils/dataTable/invitationsSorts";
import { createListSearchParamsSchema } from "../../utils/listSearchParamsSchema";

const TABLE_DEFAULT_LIMIT = 10;
const TABLE_DEFAULT_OFFSET = 0;
const TABLE_DEFAULT_ORDER: NonNullable<GetInvitationsQuery["order"]> = "desc";

const invitationsSearchSchema = createListSearchParamsSchema(
	ALLOWED_INVITATION_SORTS,
);

export const Route = createFileRoute("/_auth/invitations")({
	validateSearch: zodValidator(invitationsSearchSchema),
	component: RouteComponent,
});

function RouteComponent() {
	const searchParams = Route.useSearch();
	const navigate = Route.useNavigate();
	const acceptInvitationMutation = useAcceptInvitation();
	const refuseInvitationMutation = useRefuseInvitation();
	const [search, setSearch] = useState(searchParams.search ?? "");
	const debouncedSearch = useDebounce(search, 400);
	const [acceptingInvitationId, setAcceptingInvitationId] = useState<
		string | null
	>(null);
	const [refusingInvitationId, setRefusingInvitationId] = useState<
		string | null
	>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const queryParams = useMemo(
		() => ({
			limit: searchParams.limit,
			offset: searchParams.offset,
			sort: searchParams.sort,
			order: searchParams.order,
			...(searchParams.search ? { search: searchParams.search } : {}),
		}),
		[searchParams],
	);

	const { data, isLoading, isError, error } = useInvitations(queryParams);

	useEffect(() => {
		const nextSearch = debouncedSearch.trim();
		if (nextSearch === (searchParams.search ?? "")) {
			return;
		}
		navigate({
			search: (prev) => ({
				...prev,
				search: nextSearch || undefined,
				offset: String(0),
			}),
			replace: true,
		});
	}, [debouncedSearch, navigate, searchParams.search]);

	const handleAcceptInvitation = async (invitationId: string) => {
		setActionError(null);
		setAcceptingInvitationId(invitationId);
		try {
			await acceptInvitationMutation.mutateAsync(invitationId);
			await queryClient.invalidateQueries({ queryKey: ["invitations"] });
			await queryClient.invalidateQueries({ queryKey: ["groups"] });
		} catch (acceptError) {
			setActionError(
				acceptError instanceof Error
					? acceptError.message
					: "Failed to accept invitation",
			);
		} finally {
			setAcceptingInvitationId(null);
		}
	};

	const handleRefuseInvitation = async (invitationId: string) => {
		setActionError(null);
		setRefusingInvitationId(invitationId);
		try {
			await refuseInvitationMutation.mutateAsync(invitationId);
			await queryClient.invalidateQueries({ queryKey: ["invitations"] });
		} catch (refuseError) {
			setActionError(
				refuseError instanceof Error
					? refuseError.message
					: "Failed to refuse invitation",
			);
		} finally {
			setRefusingInvitationId(null);
		}
	};

	return (
		<div className="space-y-4 p-6">
			<GroupHeader
				title="Invitations"
				breadcrumbItems={[{ label: "Invitations" }]}
			/>

			{isError ? (
				<ErrorMessage
					message={`Failed to load invitations: ${error?.message ?? "Unknown error"}`}
				/>
			) : null}
			{actionError ? <ErrorMessage message={actionError} /> : null}

			<InvitationsTable
				data={data?.data ?? []}
				total={data?.data?.length ?? 0}
				search={search}
				onSearchChange={setSearch}
				limit={
					Number.isNaN(Number(searchParams.limit))
						? TABLE_DEFAULT_LIMIT
						: Number(searchParams.limit)
				}
				offset={
					Number.isNaN(Number(searchParams.offset))
						? TABLE_DEFAULT_OFFSET
						: Number(searchParams.offset)
				}
				sort={searchParams.sort}
				order={searchParams.order ?? TABLE_DEFAULT_ORDER}
				onOffsetChange={(nextOffset) =>
					navigate({
						search: (prev) => ({ ...prev, offset: String(nextOffset) }),
						replace: true,
					})
				}
				onLimitChange={(nextLimit) => {
					navigate({
						search: (prev) => ({
							...prev,
							limit: String(nextLimit),
							offset: String(0),
						}),
						replace: true,
					});
				}}
				onSortChange={(next) =>
					navigate({
						search: (prev) => ({
							...prev,
							sort: next.sort,
							order: next.order,
							offset: String(0),
						}),
						replace: true,
					})
				}
				isLoading={isLoading}
				onAcceptInvitation={handleAcceptInvitation}
				onRefuseInvitation={handleRefuseInvitation}
				acceptingInvitationId={acceptingInvitationId}
				refusingInvitationId={refusingInvitationId}
			/>
		</div>
	);
}
