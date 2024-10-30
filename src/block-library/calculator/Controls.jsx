import { __ } from '@wordpress/i18n';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { BlockControls } from '@wordpress/block-editor';

export default function Controls({ isPreview = false }) {
	return (
		<BlockControls>
			{isPreview ? (
				<ToolbarGroup>
					{/* TODO: <ToolbarButton
					className="components-tab-button"
					isPressed={!isPreview}
					onClick={switchToHTML}
				>
					Snippet
				</ToolbarButton>*/}
					<ToolbarButton
						className="components-tab-button"
						isPressed={true}
					>
						{__('Preview')}
					</ToolbarButton>
				</ToolbarGroup>
			) : (
				<></>
			)}
		</BlockControls>
	);
}
