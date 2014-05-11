function csx_firstParentWithClass(node,className){
	while (node.parentNode){
		node = node.parentNode;
		if (node.className){
			if (node.className.match(className))
				return node;
		}
	}
	return false;
}