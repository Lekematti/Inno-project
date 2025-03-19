import React from 'react'
import templateHtml from '!!raw-loader!../../gen_comp/custom_page.html'

const template = { __html: templateHtml }

export const AiGenComponent = (visible: boolean) => {
  return (
    visible && (
      <div dangerouslySetInnerHTML={template} style={{ height: '100%' }} />
    )
  )
}
