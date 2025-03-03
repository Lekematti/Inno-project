export const Header = () => {
	return (
		<div
			style={{
				width: '100%',
				padding: 10,
				display: 'flex',
				background: '#bcf7e1',
				alignItems: 'center',
			}}
		>
			<p style={{ color: 'black' }}>AiWebsiteBuildr</p>
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
						background: 'blue',
						padding: 5,
						borderRadius: '5px',
						marginRight: 2,
						marginLeft: 2,
					}}
				>
					Home
				</li>
				<li
					style={{
						background: 'blue',
						padding: 5,
						borderRadius: '5px',
						marginRight: 2,
						marginLeft: 2,
					}}
				>
					<a href="#Demo">Demo</a>
				</li>
				<li
					style={{
						background: 'blue',
						padding: 5,
						borderRadius: '5px',
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
