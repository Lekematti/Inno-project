import React from 'react'
import templateHtml from '!!raw-loader!../../custom_page.html'

const template = { __html: templateHtml }

export const AiGenComponent = (visible: boolean) => {
  return (
    visible && (
      <div dangerouslySetInnerHTML={template} style={{ height: '100%' }} />
    )
  )
}
