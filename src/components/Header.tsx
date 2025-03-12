export const Header = () => {
	return (
		<div
			style={{
				width: '100%',
				padding: 10,
				display: 'flex',
				background: '#3B82F6',
				alignItems: 'center',
			}}
		>
			<p style={{ color: '#1F2937', fontWeight: 'bold' }}>AiWebsiteBuildr</p>
			<ul
				style={{
					display: 'flex',
					width: '100%',
					flexDirection: 'row',
					justifyContent: 'flex-end',
					listStyle: 'none',
					margin: 2,
				}}
			>
				<li
					style={{
						padding: 5,
						marginRight: 2,
						marginLeft: 2,
					}}
				>
					Home
				</li>
				<li
					style={{
						padding: 5,
						marginRight: 2,
						marginLeft: 2,
					}}
				>
					<a href="#Demo">Demo</a>
				</li>
				<li
					style={{
						padding: 5,
						marginRight: 2,
						marginLeft: 2,
					}}
				>
					Contact
				</li>
			</ul>
		</div>
	);
};
